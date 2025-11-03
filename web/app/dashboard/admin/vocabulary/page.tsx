"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify";
import { loadDifficultWords, loadVocabularyOverview, loadVocabularyTopics } from "@/app/apiClient/admin/analytic";
import { Pagination } from "./components/Pagination";

// Định nghĩa Type cho dữ liệu
type Overview = {
  total_vocab_entries: number;
  total_topics: number;
  avg_mastery_score: number;
};

type DifficultWord = {
  word: string;
  error_type: string;
  skill: string;
  total_errors: number;
  affected_users: number;
};

type Topic = {
  id: number;
  name_en: string;
  name_vi: string;
  total_vocab: number;
  user_name: string;
  created_at: string;
};

export default function Vocabulary() {
  // State cho Filters
  const [skill, setSkill] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | null>(null);

  // State cho Pagination
  const [wordsPage, setWordsPage] = useState(1);
  const [topicsPage, setTopicsPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // State cho Data
  const [overview, setOverview] = useState<Overview | null>(null);
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);

  // State cho Loading
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [wordsLoading, setWordsLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(true);

  // --- DATA FETCHING ---

  // 1. Tải Overview (chạy 1 lần)
  useEffect(() => {
    const fetchOverview = async () => {
      setOverviewLoading(true);
      try {
        const response = await loadVocabularyOverview();
        if (response.success) {
          setOverview(response.data);
        } else {
          toast.error(response.message || "Failed to load overview");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setOverviewLoading(false);
      }
    };
    fetchOverview();
  }, []);

  // 2. Tải Topics (chạy 1 lần)
  useEffect(() => {
    const fetchTopics = async () => {
      setTopicsLoading(true);
      try {
        const response = await loadVocabularyTopics();
        if (response.success) {
          setTopics(response.data);
        } else {
          toast.error(response.message || "Failed to load topics");
        }
      } catch (error: any) {
        toast.error(error.message || "An error occurred");
      } finally {
        setTopicsLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // 3. Tải Difficult Words (chạy lại khi filter thay đổi)
  const fetchDifficultWords = useCallback(async () => {
    setWordsLoading(true);
    try {
      const response = await loadDifficultWords({
        skill: skill || undefined,
        errorType: errorType || undefined,
      });
      if (response.success) {
        setDifficultWords(response.data);
      } else {
        toast.error(response.message || "Failed to load difficult words");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setWordsLoading(false);
    }
  }, [skill, errorType]);

  useEffect(() => {
    fetchDifficultWords();
  }, [fetchDifficultWords]);

  // --- LOGIC PAGINATION (Giữ nguyên) ---

  const paginatedWords = difficultWords.slice(
    (wordsPage - 1) * ITEMS_PER_PAGE,
    wordsPage * ITEMS_PER_PAGE
  );
  const totalWordsPages = Math.ceil(difficultWords.length / ITEMS_PER_PAGE);

  const paginatedTopics = topics.slice(
    (topicsPage - 1) * ITEMS_PER_PAGE,
    topicsPage * ITEMS_PER_PAGE
  );
  const totalTopicsPages = Math.ceil(topics.length / ITEMS_PER_PAGE);

  return (
    <div className="flex-1 px-6 py-3 space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            {overviewLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-sm text-gray-600">Total Vocabulary Entries</p>
                <p className="text-3xl font-bold mt-2">
                  {overview?.total_vocab_entries ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {overviewLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-sm text-gray-600">Vocabulary Topics</p>
                <p className="text-3xl font-bold mt-2">
                  {overview?.total_topics ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            {overviewLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : (
              <>
                <p className="text-sm text-gray-600">Avg Mastery Score</p>
                <p className="text-3xl font-bold mt-2">
                  {overview?.avg_mastery_score ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Difficult Words Card */}
      <Card>
        <CardHeader>
          <CardTitle>Difficult Words</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Filters (Giữ nguyên JSX) */}
            <div className="flex gap-4">
              <Select
                value={skill ?? "all"}
                onValueChange={(val) => setSkill(val === "all" ? null : val)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by Skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Skills</SelectItem>
                  <SelectItem value="listening">Listening</SelectItem>
                  <SelectItem value="writing">Writing</SelectItem>
                  <SelectItem value="speaking">Speaking</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                </SelectContent>
              </Select>
              {/* ... (Select cho ErrorType giữ nguyên) ... */}
            </div>

            {/* Bảng Difficult Words (Giữ nguyên JSX) */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>{/* ... (JSX TableHeader) ... */}</TableHeader>
                <TableBody>
                  {wordsLoading ? (
                   Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 5 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : paginatedWords.length === 0 ? (
                     <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No difficult words found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedWords.map((word, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium">{word.word}</TableCell>
                        <TableCell>
                          <Badge variant="destructive">{word.error_type}</Badge>
                        </TableCell>
                        <TableCell className="capitalize">{word.skill}</TableCell>
                        <TableCell>{word.total_errors}</TableCell>
                        <TableCell>{word.affected_users}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {totalWordsPages > 1 && (
                <Pagination
                  currentPage={wordsPage}
                  totalPages={totalWordsPages}
                  onPageChange={setWordsPage}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Topics Card (Giữ nguyên JSX) */}
      <Card>
        <CardHeader>
          <CardTitle>User Vocabulary Topics</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {topicsLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : paginatedTopics.length === 0 ? (
           <p className="text-center py-8 text-gray-500">No vocabulary topics found</p>
          ) : (
            <>
              <Table>
                <TableHeader>{/* ... (JSX TableHeader) ... */}</TableHeader>
                <TableBody>
                  {paginatedTopics.map((topic) => (
                    <TableRow key={topic.id}>
                      <TableCell className="font-medium">{topic.name_en}</TableCell>
                      <TableCell>{topic.name_vi}</TableCell>
                      <TableCell>
                        <Badge>{topic.total_vocab}</Badge>
                      </TableCell>
                      <TableCell>{topic.user_name}</TableCell>
                      <TableCell>
                        {new Date(topic.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {totalTopicsPages > 1 && (
                <Pagination
                  currentPage={topicsPage}
                  totalPages={totalTopicsPages}
                  onPageChange={setTopicsPage}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}