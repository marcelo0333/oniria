
export async function GenerateImage(prompt: string) {
    const response = await fetch(prompt, {
        method: 'GET',
        headers: {
        },
    });
    const data = await response.blob();
    return URL.createObjectURL(data);
}