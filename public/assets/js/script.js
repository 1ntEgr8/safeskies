// var textArea = document.querySelector('textarea');
// var select = document.querySelector('select');

// select.addEventListener('change', () => {
//     if(select.value === 'other') {
//         textArea.removeAttribute('disabled');
//     } else {
//         textArea.setAttribute('disabled', 'disabled');
//     }
// });

var clearButton = document.querySelector('.clear');
var textArea = document.querySelector('textarea');

clearButton.addEventListener('click', () => {
    textArea.value = '';
});


