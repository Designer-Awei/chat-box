/**
 * 允许上传的图片 MIME 类型
 */
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

/** 单张图片最大体积（字节） */
const MAX_IMAGE_SIZE = 4 * 1024 * 1024;

/** 单次最多上传图片数量 */
export const MAX_IMAGES_PER_MESSAGE = 3;

/**
 * 将文件读取为 base64 Data URL
 * @param file 图片文件
 * @returns Data URL 字符串
 */
export function readImageAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      reject(new Error("仅支持 JPG、PNG、GIF、WEBP 格式图片"));
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      reject(new Error("单张图片不能超过 4MB"));
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }
      reject(new Error("图片读取失败"));
    };

    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}
