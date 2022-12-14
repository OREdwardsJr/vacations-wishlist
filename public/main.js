const KEY = "9F6mguTnJtDRAlfzGfzrDcZN_rRWYq3-Y9f6-obW80Y";

// Start app
loadImgs();
addEventListeners();

// Functions
function loadImgs() {
    const containers = document.querySelectorAll(".containers");
    containers.forEach((obj) => {
        loadImg(obj);
    });
};

function loadImg(obj, overrideDefault=false, description=null) { // obj should be the parent ".container" node
    let searchKey = description || obj.children[1].children[0].children[0].textContent; // #destination.textContent

    const url = `https://api.unsplash.com/photos/random?query=${searchKey}&per_page=1&page=1&client_id=${KEY}`;

    unsplashAPICall(url).then(data => {
        let img_result = data.urls.thumb;

        if (!overrideDefault) {
            let image_element = document.createElement('img');
            
            image_element.src = img_result;

            obj.children[0].appendChild(image_element);
        } else {
            obj.children[0].children[0].src = img_result;
        }
    });

    // inner functions
    async function unsplashAPICall(url) {
        const request = await fetch(url);
        const data = request.json();
        return data;
    };
};

function addEventListeners() {
    activateEditButtons();
    activateRemoveButtons();
};

function activateEditButtons() { // obj is expected to be .container
    const editBtns = document.querySelectorAll(".btn-edit");

     editBtns.forEach(button => {
        button.addEventListener('click', (e) => editContents(e), false)
    });
};

// edit post
function editContents(obj) { // obj is expected to be .btn-edit
    obj.preventDefault();
    
    let property;

    const objTarget = obj.target;
    const obj_container = objTarget.parentNode.parentNode.parentNode; 
    const obj_id = obj_container.dataset.db_id; // this doesn't work with IE versions earlier than IE 11. Would need to change to account for that
    const updatedContent = prompt("Enter desired update");
    const updatedField = { };

    if (objTarget.classList.contains("btn-edit-destination")) {
        property = "destination";
    } else if (objTarget.classList.contains("btn-edit-location")) {
        property = "location";
    } else { // description
        property = "description";
    };

    updatedField[property] = updatedContent; // ES6 only allows you to use variables as keys in this manner

    fetch('/api/destination/update/' + obj_id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedField),
      })
        .then((response) => response.json())
        .then((data) => {
            if (!!data) {
                objTarget.previousElementSibling.textContent = updatedContent;
            };
        });
    
    if (property === 'destination') loadImg(obj_container, true, updatedContent);
};
 
function activateRemoveButtons() { // obj is expected to be .container
    const removeBtns = document.querySelectorAll(".btn-remove");
    
    removeBtns.forEach(button => {
        button.addEventListener('click', (elem) => removeEntry(elem.target));
    });
};

function removeEntry(obj) { // obj is expected to be .btn-remove node
    const parent_node = obj.parentNode.parentNode;
    const obj_id = parent_node.dataset.db_id;
    
    fetch('/api/destination/delete/' + obj_id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json());

    parent_node.remove();
};