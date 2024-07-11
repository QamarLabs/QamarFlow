export function retrieveUsernmeFromEmail(email: string) {
  const [username] = email.split('@');
  return username;
}

export function getRandomImageUrl() {
  const natureKeywords = ['beach', 'mountain', 'sea', 'snow', 'island'];
  return `https://picsum.photos/seed/${natureKeywords[Math.floor(Math.random() * natureKeywords.length)]}/3000/2000.webp`;
}

export async function getUrlFromBase64(url: string) {
  const response = await fetch(url);
  const blob = await response.blob();
  const reader = new FileReader();
  reader.readAsDataURL(blob);
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
