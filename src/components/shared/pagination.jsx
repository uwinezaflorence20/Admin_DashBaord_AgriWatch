import React from 'react';
import { TbChevronsLeft, TbChevronLeft, TbChevronRight, TbChevronsRight } from 'react-icons/tb';

export default function Pagination({ currentPage, totalPages, onPageChange, rowsPerPage, onRowsPerPageChange }) {
    return (
        <div className="flex justify-end items-center gap-4 mt-4 font-lexend overflow-hidden">
            {onRowsPerPageChange && (
                <div className="flex items-center gap-2 mr-2 group">
                    <span className="text-[0.75rem] text-[#72819c] font-light">Rows per page:</span>
                    <div className="relative">
                        <input
                            type="number"
                            min="1"
                            max="100"
                            value={rowsPerPage || ''}
                            onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                    onRowsPerPageChange(val);
                                } else if (e.target.value === '') {
                                    onRowsPerPageChange(0);
                                }
                            }}
                            className="w-12 h-8 bg-white border border-[#e2e8f4] rounded-md text-center text-[0.8rem] text-[#2b3d5e] outline-none focus:border-[#635BFF] focus:ring-1 focus:ring-[#635BFF]/20 transition-all appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        />
                    </div>
                </div>
            )}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1}
                    className={`w-18 h-8 flex items-center justify-center rounded-md transition-all bg-transparent border-none outline-none p-0 ${currentPage === 1 ? 'text-[#72819c] opacity-30 cursor-default' : 'text-[#72819c] hover:bg-[#f5f8ff] hover:text-[#4875e6] cursor-pointer'}`}
                >
                    <TbChevronsLeft size={18} />
                </button>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`w-18 h-8 flex items-center justify-center transition-all bg-transparent border-none outline-none p-0 ${currentPage === 1 ? 'text-[#72819c] opacity-30 cursor-default' : 'text-[#72819c] hover:bg-[#f5f8ff] hover:text-[#4875e6] cursor-pointer'}`}
                >
                    <TbChevronLeft size={18} />
                </button>
                <div className="flex items-center justify-center bg-gradient-to-br from-primary to-accent text-white rounded-md overflow-hidden min-w-[40px] h-8 shadow-sm">
                    <input
                        type="number"
                        min="1"
                        max={totalPages}
                        value={currentPage}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                                onPageChange(val);
                            }
                        }}
                        className="w-full h-full bg-transparent border-none text-center text-[0.8rem] font-bold text-white outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none p-0"
                    />
                </div>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`w-18 h-8 flex items-center justify-center transition-all bg-transparent border-none outline-none p-0 ${currentPage === totalPages || totalPages === 0 ? 'text-[#72819c] opacity-30 cursor-default' : 'text-[#72819c] hover:bg-[#f5f8ff] hover:text-[#4875e6] cursor-pointer'}`}
                >
                    <TbChevronRight size={18} />
                </button>
                <button
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`w-18 h-8 flex items-center justify-center rounded-md transition-all bg-transparent border-none outline-none p-0 ${currentPage === totalPages || totalPages === 0 ? 'text-[#72819c] opacity-30 cursor-default' : 'text-[#72819c] hover:bg-[#f5f8ff] hover:text-[#4875e6] cursor-pointer'}`}
                >
                    <TbChevronsRight size={18} />
                </button>
            </div>
            <span className="text-[0.75rem] text-[#72819c] font-light ml-2">
                Page {currentPage} of {totalPages || 1}
            </span>
        </div>
    );
}