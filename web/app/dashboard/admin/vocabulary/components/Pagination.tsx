// File: components/Pagination.tsx (File mới bạn tự tạo)
"use client";

import {
  Pagination as ShadcnPagination, // Đổi tên để tránh xung đột
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 1. Định nghĩa props mà component của bạn sẽ nhận
type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  
  // 2. Logic xử lý khi bấm nút
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 3. Không hiển thị gì nếu chỉ có 1 trang
  if (totalPages <= 1) {
    return null;
  }

  // 4. Render component, sử dụng các khối của shadcn/ui
  return (
    <ShadcnPagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
        </PaginationItem>

        <PaginationItem>
          <span className="text-sm font-medium px-4">
            Page {currentPage} of {totalPages}
          </span>
        </PaginationItem>

        <PaginationItem>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </PaginationItem>
      </PaginationContent>
    </ShadcnPagination>
  );
}