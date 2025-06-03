async function getStudentsList() {
  try {
    let response = await fetch('http://localhost:3000/api/students', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось получить данные'}`);
    let data = await response.json();
    console.log('Данные с сервера:', data);
    return data;
  } catch (error) {
    throw error;
  }
}

async function addStudent(obj) {
  try {
    let response = await fetch('http://localhost:3000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(obj)
    });
    if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось добавить студента'}`);
    let data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

async function deleteStudent(id) {
  try {
    let response = await fetch(`http://localhost:3000/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error(`Ошибка: ${response.status} - ${response.statusText || 'Не удалось удалить студента'}`);
    return;
  } catch (error) {
    throw error;
  }
}

export { getStudentsList, addStudent, deleteStudent };
