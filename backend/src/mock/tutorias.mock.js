const semestres = [
  { id: 1, nombre: '2023-I', cerrado: true },
  { id: 2, nombre: '2023-II', cerrado: true },
  { id: 3, nombre: '2024-I', cerrado: true }
];

const tutorias = Array.from({ length: 450 }).map((_, i) => ({
  id: i + 1,
  estudiante: `Estudiante ${i + 1}`,
  tutor: `Tutor ${((i % 5) + 1)}`,
  tipo: ['Académica', 'Personal', 'Profesional'][i % 3],
  fecha: `2023-0${(i % 9) + 1}-15`,
  semestreId: ((i % 3) + 1),
  observaciones: 'Detalle completo de la tutoría'
}));

module.exports = {
  semestres,
  tutorias
};