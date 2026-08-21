// Tách riêng khỏi actions.ts vì file "use server" chỉ được export async
// function, không được export hằng số.
export const SPOILAGE_REASONS = ["Hư hỏng", "Dập nát", "Hết hạn", "Khác"] as const;
