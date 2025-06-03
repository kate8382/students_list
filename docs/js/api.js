async function getStudentsList() {
  let response = await fetch('http://localhost:3000/api/students', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось получить данные'}`);
  let data = await response.json();
  return data;
}

async function addStudent(obj) {
  let response = await fetch('http://localhost:3000/api/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(obj)
  });
  if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось добавить студента'}`);
  let data = await response.json();
  return data;
}

async function deleteStudent(id) {
  let response = await fetch(`http://localhost:3000/api/students/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось удалить студента'}`);
  return;
}

export { getStudentsList, addStudent, deleteStudent };
