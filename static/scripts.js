

if(document.querySelector("#add-another-action")) {

    var addAnotherButton = document.querySelector("#add-another-action");
    addAnotherButton.addEventListener("click", () => {

        var template = document.querySelector('#action-template');
        var list = document.querySelector("#actions-list");
        var newInstance = template.content.cloneNode(true);
        newInstance.querySelector(".remove-this-action").addEventListener("click", e => {
            e.target.parentNode.remove();
        });
        list.appendChild(newInstance);

    });

    // Below is almost identical to above TODO: Refactor
    var addAnotherCompleteButton = document.querySelector("#add-another-completion");
    addAnotherButton.addEventListener("click", () => {

        var template = document.querySelector('#action-complete-template');
        var list = document.querySelector("#actions-complete-list");
        var newInstance = template.content.cloneNode(true);
        newInstance.querySelector(".remove-this-action").addEventListener("click", e => {
            e.target.parentNode.remove();
        });
        list.appendChild(newInstance);

    });
}