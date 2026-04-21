import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Upload, Search, Brain, Network, CheckCircle } from "lucide-react";

interface ProcessStep {
  id: number;
  icon: any;
  label: string;
  description: string;
}

const steps: ProcessStep[] = [
  { id: 1, icon: Upload, label: "Uploading file", description: "Transferring document to secure storage" },
  { id: 2, icon: Search, label: "Running OCR / Transcribing", description: "Extracting text and data from document" },
  { id: 3, icon: Brain, label: "Extracting entities with NLP", description: "Identifying suppliers, products, and emissions data" },
  { id: 4, icon: Network, label: "Storing in knowledge graph", description: "Creating relationships and graph nodes" },
  { id: 5, icon: CheckCircle, label: "Complete", description: "3 emission records extracted successfully" },
];

export function UploadProcessing() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      const timeout = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, navigate]);

  return (
    <div className="min-h-screen bg-[var(--eco-bg)] flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <div className="bg-white rounded-2xl border border-[var(--eco-border)] p-12">
          <h2 className="text-2xl font-semibold text-[var(--eco-text-primary)] text-center mb-2">
            Processing Upload
          </h2>
          <p className="text-sm text-[var(--eco-text-secondary)] text-center mb-12">
            Please wait while we extract and analyze your document
          </p>

          <div className="space-y-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              const isFuture = index > currentStep;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-xl transition-all ${
                    isActive
                      ? "bg-[var(--eco-success-bg)] border-2 border-[var(--eco-primary)]"
                      : isComplete
                      ? "bg-[var(--eco-bg)] border border-[var(--eco-border)]"
                      : "bg-white border border-[var(--eco-border)] opacity-50"
                  }`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isActive
                      ? "bg-[var(--eco-primary)] text-white"
                      : isComplete
                      ? "bg-[var(--eco-secondary)] text-white"
                      : "bg-[var(--eco-border)] text-[var(--eco-text-secondary)]"
                  }`}>
                    {isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold ${
                        isActive || isComplete
                          ? "text-[var(--eco-text-primary)]"
                          : "text-[var(--eco-text-secondary)]"
                      }`}>
                        {step.id}. {step.label}
                      </h3>
                      {isComplete && (
                        <CheckCircle className="w-4 h-4 text-[var(--eco-primary)]" />
                      )}
                    </div>
                    <p className={`text-sm mt-1 ${
                      isActive || isComplete
                        ? "text-[var(--eco-text-secondary)]"
                        : "text-[var(--eco-text-secondary)] opacity-50"
                    }`}>
                      {step.description}
                    </p>

                    {isActive && index < steps.length - 1 && (
                      <div className="mt-3">
                        <div className="h-1.5 bg-[var(--eco-border)] rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-[var(--eco-primary)]"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 1.5, ease: "linear" }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {currentStep === steps.length - 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 text-center"
            >
              <p className="text-sm text-[var(--eco-text-secondary)]">
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
