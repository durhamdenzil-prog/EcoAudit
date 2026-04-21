import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 60000,
});

// Dashboard
export const getDashboardStats = () =>
  api.get("/dashboard/stats").then((r) => r.data);

// Upload files
export const uploadPDF = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/ingest/pdf", form).then((r) => r.data);
};

export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/ingest/image", form).then((r) => r.data);
};

export const uploadAudio = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/ingest/audio", form).then((r) => r.data);
};

// Query
export const queryGraph = (question: string) =>
  api.post("/query/", { question }).then((r) => r.data);

export const getQuerySuggestions = () =>
  api.get("/query/suggestions").then((r) => r.data);

// Reports
export const generateReport = () =>
  api.post("/report/generate").then((r) => r.data);

export const getReportDownloadUrl = (filename: string) =>
  `http://localhost:8000/api/report/download/${filename}`;