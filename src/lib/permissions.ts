// Allowed uploaders - add your friend's email here
const ALLOWED_UPLOADERS = [
  'puneetkumargarg@gmail.com', // Replace with your actual email
  'arunangshu@example.com'     // Replace with your friend's email
];

export const canUserUpload = (userEmail: string): boolean => {
  return ALLOWED_UPLOADERS.includes(userEmail.toLowerCase());
};