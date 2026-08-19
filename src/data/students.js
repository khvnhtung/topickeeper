/**
 * IELTS Speaking Quest — Student Profiles & Registry
 * Manages active student profiles, metadata, and routing identifiers.
 */

const STUDENTS = [
  {
    slug: 'phuong-linh',
    name: 'Phương Linh',
    displayName: 'Phương Linh',
    target: 'IELTS 6.0',
    avatar: '👩‍🎓',
    isDefault: true,
    description_vi: 'Học viên Phương Linh · Mục tiêu 6.0',
    description_en: 'Student Phuong Linh · Target Band 6.0'
  },
  {
    slug: 'khai',
    name: 'Khải',
    displayName: 'Khải',
    target: 'IELTS 6.5 - 7.0',
    avatar: '👨‍🎓',
    isDefault: false,
    description_vi: 'Học viên Khải · Mục tiêu 6.5–7.0',
    description_en: 'Student Khai · Target Band 6.5–7.0'
  }
];

const DEFAULT_STUDENT_SLUG = 'phuong-linh';

function getDefaultStudent() {
  return STUDENTS.find(s => s.isDefault) || STUDENTS[0];
}

function getStudentBySlug(slug) {
  if (!slug) return getDefaultStudent();
  const normalized = String(slug).toLowerCase().trim().replace(/^\/|\/$/g, '');
  const found = STUDENTS.find(s => s.slug.toLowerCase() === normalized);
  return found || getDefaultStudent();
}

function getAllStudents() {
  return STUDENTS;
}

// Dual export support (Node.js CJS & Browser global)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { STUDENTS, DEFAULT_STUDENT_SLUG, getDefaultStudent, getStudentBySlug, getAllStudents };
}

if (typeof window !== 'undefined') {
  window.STUDENTS = STUDENTS;
  window.DEFAULT_STUDENT_SLUG = DEFAULT_STUDENT_SLUG;
  window.getDefaultStudent = getDefaultStudent;
  window.getStudentBySlug = getStudentBySlug;
  window.getAllStudents = getAllStudents;
}
