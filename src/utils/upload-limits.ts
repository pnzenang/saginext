// Uploads pass through a Vercel Function, which rejects request bodies over 4.5 MB,
// so the limit stays below that to leave room for the other form fields.
export const maxDocumentationFileSizeMb = 4

export const maxDocumentationFileSize = maxDocumentationFileSizeMb * 1024 * 1024

export const documentationFileTooLargeMessages = {
  en: `This file is too large. Please upload a file that is ${maxDocumentationFileSizeMb} MB or smaller.`,
  fr: `Ce fichier est trop volumineux. Veuillez téléverser un fichier de ${maxDocumentationFileSizeMb} Mo ou moins.`
}

export const formatFileSizeInMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(1)} MB`
