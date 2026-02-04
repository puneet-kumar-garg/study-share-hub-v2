// Allowed uploaders - add your friend's email here
const ALLOWED_UPLOADERS = [
  'puneet@example.com', // Replace with your email
  'friend@example.com'  // Replace with your friend's email
];

export const canUserUpload = (userEmail: string): boolean => {
  return ALLOWED_UPLOADERS.includes(userEmail.toLowerCase());
};