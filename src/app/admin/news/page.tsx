"use client";

import { useEffect, useMemo, useState } from "react";

import { createNews, deleteNews, getAllNews, updateNews } from "@/apis/admin/news.api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DataResponse } from "@/types/apiDTO";
import { Search } from "lucide-react";
import { toast } from "sonner";

type NewsItem = {
	_id: string;
	title: string;
	imageUrl?: string;
	content?: string;
	startDate?: string;
	endDate?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
};

const NewsPage = () => {
	const [items, setItems] = useState<NewsItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [query, setQuery] = useState("");
	const [showEditModal, setShowEditModal] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [editForm, setEditForm] = useState({
		id: "",
		title: "",
		content: "",
		startDate: "",
		endDate: "",
		isActive: true,
		imageFile: null as File | null,
	});
	const [createForm, setCreateForm] = useState({
		title: "",
		content: "",
		startDate: "",
		endDate: "",
		isActive: true,
		imageFile: null as File | null,
	});

	const load = async () => {
		setLoading(true);
		setError(null);
		try {
			const res: DataResponse<NewsItem[]> = await getAllNews();
			setItems(res.data || []);
		} catch (err: any) {
			setError(err?.response?.data?.message || "Không thể tải danh sách tin tức");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const filteredItems = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return items;
		return items.filter((item) => item.title?.toLowerCase().includes(q));
	}, [items, query]);

	const formatDate = (value?: string) => {
		if (!value) return "-";
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "-";
		return date.toLocaleDateString("vi-VN", { year: "numeric", month: "2-digit", day: "2-digit" });
	};

	const truncateText = (value?: string, max = 80) => {
		if (!value) return "";
		if (value.length <= max) return value;
		return `${value.slice(0, max)}...`;
	};

	const openEdit = (item: NewsItem) => {
		setEditForm({
			id: item._id,
			title: item.title || "",
			content: item.content || "",
			startDate: item.startDate ? item.startDate.slice(0, 10) : "",
			endDate: item.endDate ? item.endDate.slice(0, 10) : "",
			isActive: item.isActive ?? true,
			imageFile: null,
		});
		setShowEditModal(true);
	};

	const handleUpdate = async () => {
		if (!editForm.title.trim()) {
			toast.error("Vui lòng nhập tiêu đề");
			return;
		}

		setIsUpdating(true);
		try {
			const formData = new FormData();
			formData.append("title", editForm.title.trim());
			formData.append("content", editForm.content.trim());
			if (editForm.startDate) formData.append("startDate", editForm.startDate);
			if (editForm.endDate) formData.append("endDate", editForm.endDate);
			formData.append("isActive", String(editForm.isActive));
			if (editForm.imageFile) formData.append("image", editForm.imageFile);

			await updateNews(editForm.id, formData);
			toast.success("Cập nhật tin tức thành công", { id: "update-news" });
			setShowEditModal(false);
			load();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Không thể cập nhật tin tức");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleDelete = async (id: string) => {
		const ok = window.confirm("Xóa tin tức này?");
		if (!ok) return;
		setDeletingId(id);
		try {
			await deleteNews(id);
			toast.success("Đã xóa tin tức", { id: `delete-${id}` });
			load();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Không thể xóa tin tức");
		} finally {
			setDeletingId(null);
		}
	};

	const handleCreate = async () => {
		if (!createForm.title.trim()) {
			toast.error("Vui lòng nhập tiêu đề");
			return;
		}

		setIsCreating(true);
		try {
			const formData = new FormData();
			formData.append("title", createForm.title.trim());
			formData.append("content", createForm.content.trim());
			if (createForm.startDate) formData.append("startDate", createForm.startDate);
			if (createForm.endDate) formData.append("endDate", createForm.endDate);
			formData.append("isActive", String(createForm.isActive));
			if (createForm.imageFile) formData.append("image", createForm.imageFile);

			await createNews(formData);
			toast.success("Tạo tin tức thành công", { id: "create-news" });
			setShowCreateModal(false);
			setCreateForm({ title: "", content: "", startDate: "", endDate: "", isActive: true, imageFile: null });
			load();
		} catch (err: any) {
			toast.error(err?.response?.data?.message || "Không thể tạo tin tức");
		} finally {
			setIsCreating(false);
		}
	};

	return (
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
				<div className="max-w-7xl mx-auto p-6 space-y-6">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<p className="text-gray-600 dark:text-gray-400 mt-1">Danh sách tin tức hiện có</p>
						</div>
						<div className="flex items-center gap-2">
							<Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white hover:bg-blue-700">
								Thêm mới
							</Button>
						</div>
					</div>

					<Card>
						<CardContent className="p-6 space-y-4">
							<div className="flex items-center gap-3">
								<div className="relative grow">
									<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
									<Input
										placeholder="Tìm theo tiêu đề"
										value={query}
										onChange={(e) => setQuery(e.target.value)}
										className="pl-9"
									/>
								</div>
							</div>

							{error && <div className="text-sm text-red-600 dark:text-red-400">{String(error)}</div>}

							<div className="overflow-x-auto border rounded-md">
								<table className="w-full text-sm">
									<thead className="bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300">
										<tr>
											<th className="px-4 py-3 text-left font-medium">Tiêu đề</th>
											<th className="px-4 py-3 text-left font-medium">Ảnh</th>
											<th className="px-4 py-3 text-left font-medium">Nội dung</th>
											<th className="px-4 py-3 text-left font-medium">Bắt đầu</th>
											<th className="px-4 py-3 text-left font-medium">Kết thúc</th>
											<th className="px-4 py-3 text-left font-medium">Trạng thái</th>
											<th className="px-4 py-3 text-left font-medium">Tạo lúc</th>
											<th className="px-4 py-3 text-right font-medium w-44">Hành động</th>
										</tr>
									</thead>
									<tbody>
										{loading ? (
											<tr>
												<td className="px-4 py-4" colSpan={8}>
													Đang tải danh sách...
												</td>
											</tr>
										) : filteredItems.length === 0 ? (
											<tr>
												<td className="px-4 py-6 text-center text-gray-500 dark:text-gray-400" colSpan={8}>
													Không có tin tức phù hợp
												</td>
											</tr>
										) : (
											filteredItems.map((item, idx) => (
												<tr
													key={item._id}
													className="border-t odd:bg-white even:bg-gray-50 dark:odd:bg-slate-900 dark:even:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
												>
													<td className="px-4 py-3 font-medium" title={item.title}>
														{truncateText(item.title, 80)}
													</td>
													<td className="px-4 py-3">
														{item.imageUrl ? (
															<img
																src={item.imageUrl}
																alt={item.title}
																className="h-16 w-24 rounded object-cover"
															/>
														) : (
															<span className="text-muted-foreground">Không có ảnh</span>
														)}
													</td>
													<td className="px-4 py-3" title={item.content || "(Trống)"}>
														<div className="max-h-32 overflow-auto whitespace-pre-line text-muted-foreground">
															{item.content || "(Trống)"}
														</div>
													</td>
													<td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(item.startDate)}</td>
													<td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(item.endDate)}</td>
													<td className="px-4 py-3">
														{item.isActive ? (
															<span className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
																Đang hoạt động
															</span>
														) : (
															<span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-700">
																Ngưng
															</span>
														)}
													</td>
													<td className="px-4 py-3 text-muted-foreground">{formatDate(item.createdAt)}</td>
													<td className="px-4 py-3">
														<div className="flex justify-end gap-2">
															<Button
																variant="outline"
																size="sm"
																onClick={() => openEdit(item)}
															>
																Sửa
															</Button>
															<Button
																variant="outline"
																size="sm"
																className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																onClick={() => handleDelete(item._id)}
																disabled={deletingId === item._id}
															>
																{deletingId === item._id ? "Đang xóa..." : "Xóa"}
															</Button>
														</div>
													</td>
												</tr>
											))
										)}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>

					<Dialog open={showEditModal} onOpenChange={setShowEditModal}>
						<DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
							<DialogHeader>
								<DialogTitle>Sửa tin tức</DialogTitle>
								<DialogDescription>Cập nhật thông tin tin tức</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-2">
								<div className="space-y-2">
									<label className="text-sm font-medium">Tiêu đề *</label>
									<Input
										value={editForm.title}
										onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
										placeholder="Nhập tiêu đề"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Nội dung</label>
									<Textarea
										value={editForm.content}
										onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
										rows={4}
										className="max-h-48 min-h-[160px] overflow-y-auto resize-none"
										placeholder="Nhập nội dung"
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Bắt đầu</label>
										<Input
											type="date"
											value={editForm.startDate}
											onChange={(e) => setEditForm((f) => ({ ...f, startDate: e.target.value }))}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Kết thúc</label>
										<Input
											type="date"
											value={editForm.endDate}
											onChange={(e) => setEditForm((f) => ({ ...f, endDate: e.target.value }))}
										/>
									</div>
								</div>
								<div className="space-y-3">
									<label className="text-sm font-medium">Trạng thái</label>
									<select
										className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
										value={editForm.isActive ? "true" : "false"}
										onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "true" }))}
									>
										<option value="true">Đang hoạt động</option>
										<option value="false">Ngưng</option>
									</select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Ảnh (tùy chọn)</label>
									<Input
										type="file"
										accept="image/*"
										onChange={(e) => setEditForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))}
									/>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={() => setShowEditModal(false)} disabled={isUpdating}>
									Hủy
								</Button>
								<Button onClick={handleUpdate} disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">
									{isUpdating ? "Đang lưu..." : "Lưu"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>

					<Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
						<DialogContent className="max-w-none w-[800px] max-h-[90vh] flex flex-col p-6 !sm:max-w-none">
							<DialogHeader>
								<DialogTitle>Thêm tin tức</DialogTitle>
								<DialogDescription>Tạo mới tin tức</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-2">
								<div className="space-y-2">
									<label className="text-sm font-medium">Tiêu đề *</label>
									<Input
										value={createForm.title}
										onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
										placeholder="Nhập tiêu đề"
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Nội dung</label>
									<Textarea
										value={createForm.content}
										onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
										rows={4}
										className="max-h-48 min-h-[160px] overflow-y-auto resize-none"
										placeholder="Nhập nội dung"
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<label className="text-sm font-medium">Bắt đầu</label>
										<Input
											type="date"
											value={createForm.startDate}
											onChange={(e) => setCreateForm((f) => ({ ...f, startDate: e.target.value }))}
										/>
									</div>
									<div className="space-y-2">
										<label className="text-sm font-medium">Kết thúc</label>
										<Input
											type="date"
											value={createForm.endDate}
											onChange={(e) => setCreateForm((f) => ({ ...f, endDate: e.target.value }))}
										/>
									</div>
								</div>
								<div className="space-y-3">
									<label className="text-sm font-medium">Trạng thái</label>
									<select
										className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-100"
										value={createForm.isActive ? "true" : "false"}
										onChange={(e) => setCreateForm((f) => ({ ...f, isActive: e.target.value === "true" }))}
									>
										<option value="true">Đang hoạt động</option>
										<option value="false">Ngưng</option>
									</select>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Ảnh (tùy chọn)</label>
									<Input
										type="file"
										accept="image/*"
										onChange={(e) => setCreateForm((f) => ({ ...f, imageFile: e.target.files?.[0] || null }))}
									/>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									variant="outline"
									onClick={() => {
										setShowCreateModal(false);
										setCreateForm({ title: "", content: "", startDate: "", endDate: "", isActive: true, imageFile: null });
									}}
									disabled={isCreating}
								>
									Hủy
								</Button>
								<Button
									onClick={handleCreate}
									disabled={isCreating || !createForm.title.trim()}
									className="bg-blue-600 text-white hover:bg-blue-700"
								>
									{isCreating ? "Đang lưu..." : "Tạo"}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
	);
};

export default NewsPage;
