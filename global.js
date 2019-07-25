function addStyleClassToElement(id, className) {
  var element, name, arr;
  element = document.getElementById(id);
  name = className;
  arr = element.className.split(" ");
  if (arr.indexOf(name) == -1) {
    element.className += " " + name;
  }
}