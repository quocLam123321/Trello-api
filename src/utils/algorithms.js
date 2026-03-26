/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

// hàm tính skip phục vụ cho phân trang
export const pagingSkipValue = (page, itemsPerPage) => {
  // nếu đầu vào có vấn đề return 0
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0
  return (page - 1) * itemsPerPage
}
