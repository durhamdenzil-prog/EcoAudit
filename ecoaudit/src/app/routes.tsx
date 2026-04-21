import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { Dashboard } from "./pages/Dashboard";
import { Analytics } from "./pages/Analytics";
import { Suppliers } from "./pages/Suppliers";
import { KnowledgeGraph } from "./pages/KnowledgeGraph";
import { ReportPreview } from "./pages/ReportPreview";
import { UploadProcessing } from "./pages/UploadProcessing";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "analytics", Component: Analytics },
      { path: "suppliers", Component: Suppliers },
      { path: "knowledge-graph", Component: KnowledgeGraph },
      { path: "report", Component: ReportPreview },
      { path: "upload-processing", Component: UploadProcessing },
    ],
  },
]);