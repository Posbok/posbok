export function clearFormInputs() {
  // Select the form element and reset its inputs
  const form = document.querySelector('.createStaffModal');

  if (form) {
    form.reset(); // This will reset all input fields to their default values
  }
}
