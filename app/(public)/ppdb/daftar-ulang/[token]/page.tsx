"use client";

import { useEffect, useState, useCallback } from "react";
import { getSubmissionByToken } from "@/actions/ppdb";
import { Step1DataDiri } from "@/components/ppdb/Step1DataDiri";
import { Step2Berkas } from "@/components/ppdb/Step2Berkas";
import { Step3Konfirmasi } from "@/components/ppdb/Step3Konfirmasi";
import {
  CheckCircle2,
  Upload,
  ClipboardCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: { token: string };
}

type StepNum = 1 | 2 | 3 | 4; // 4 = selesai

const STEPS = [
  { num: 1, label: "Data Diri", icon: CheckCircle2 },
  { num: 2, label: "Upload Berkas", icon: Upload },
  { num: 3, label: "Konfirmasi", icon: ClipboardCheck },
];

export default function DaftarUlangPage({ params }: Props) {
  const { token } = params;
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isAlreadyDone, setIsAlreadyDone] = useState(false);
  const [registrant, setRegistrant] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<StepNum>(1);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getSubmissionByToken(token);
      if (!data) {
        setNotFound(true);
        return;
      }
      setRegistrant(data.registrant);
      setSubmission(data.submission);

      // If already fully submitted & verified
      if (data.registrant.status === "terverifikasi") {
        setIsAlreadyDone(true);
        return;
      }

      // Resume from where they left off
      if (data.submission?.is_submitted) {
        setCurrentStep(4);
      } else if (data.submission?.current_step) {
        setCurrentStep(data.submission.current_step as StepNum);
      } else {
        setCurrentStep(1);
      }
    } catch {
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleStepComplete() {
    setCurrentStep((prev) => {
      const next = (prev + 1) as StepNum;
      if (next === 4) loadData(); // reload to get fresh submission data
      return next;
    });
    loadData();
  }

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Memuat data...</p>
        </div>
      </div>
    );
  }

  // ── Not Found ──
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Token Tidak Valid
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Link daftar ulang yang Anda gunakan tidak valid atau sudah kadaluarsa. Silakan
            kembali ke halaman verifikasi.
          </p>
          <Link
            href="/ppdb/verifikasi"
            className="inline-flex items-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl
              hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Verifikasi
          </Link>
        </div>
      </div>
    );
  }

  // ── Already Verified ──
  if (isAlreadyDone) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Daftar Ulang Terverifikasi!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            Selamat, <strong className="text-slate-700 dark:text-slate-200">{registrant?.nama}</strong>!
            Berkas daftar ulang Anda telah diverifikasi oleh admin. Anda resmi terdaftar sebagai
            siswa baru. Informasi lebih lanjut akan disampaikan melalui pihak sekolah.
          </p>
        </div>
      </div>
    );
  }

  // ── Already Submitted (waiting verification) ──
  if (currentStep === 4) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
            Menunggu Verifikasi Admin
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Formulir daftar ulang atas nama{" "}
            <strong className="text-slate-700 dark:text-slate-200">{registrant?.nama}</strong> telah
            berhasil dikirim. Tim kami akan memverifikasi berkas Anda dalam 1–3 hari kerja.
          </p>
          <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full px-4 py-2 text-sm font-medium">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            Status: Sedang Diproses
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            href="/ppdb"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Info PPDB
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-1">
            Formulir Daftar Ulang
          </h1>
          {registrant && (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No. Peserta:{" "}
              <span className="font-mono font-semibold text-primary">
                {registrant.no_peserta}
              </span>{" "}
              &mdash; {registrant.nama}
            </p>
          )}
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((step, i) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;
            const Icon = step.icon;
            return (
              <div key={step.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-green-500 border-green-500"
                        : isActive
                        ? "bg-primary border-primary"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Icon
                        className={`w-5 h-5 ${
                          isActive
                            ? "text-white"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1.5 font-medium ${
                      isActive
                        ? "text-primary"
                        : isCompleted
                        ? "text-green-600 dark:text-green-400"
                        : "text-slate-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-16 md:w-24 h-0.5 mx-1 mb-4 transition-all duration-300 ${
                      currentStep > step.num
                        ? "bg-green-400"
                        : "bg-slate-200 dark:bg-slate-700"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {currentStep === 1 && "Step 1 — Konfirmasi Data Diri"}
              {currentStep === 2 && "Step 2 — Upload Berkas Persyaratan"}
              {currentStep === 3 && "Step 3 — Tinjau & Konfirmasi"}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {currentStep === 1 && "Lengkapi data diri dan informasi orang tua/wali sesuai dokumen resmi."}
              {currentStep === 2 && "Unggah seluruh berkas persyaratan dalam format gambar atau PDF."}
              {currentStep === 3 && "Tinjau kembali seluruh data sebelum dikirim ke admin untuk diverifikasi."}
            </p>
          </div>

          {currentStep === 1 && (
            <Step1DataDiri
              token={token}
              initialData={submission?.step_data_diri}
              noPeserta={registrant?.no_peserta}
              namaFromRegistrant={registrant?.nama}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 2 && (
            <Step2Berkas
              token={token}
              existingBerkas={submission?.step_berkas}
              onComplete={handleStepComplete}
            />
          )}
          {currentStep === 3 && (
            <Step3Konfirmasi
              token={token}
              dataDiri={submission?.step_data_diri}
              berkas={submission?.step_berkas}
              onComplete={handleStepComplete}
            />
          )}
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500 mt-6">
          Data Anda dilindungi dan hanya digunakan untuk keperluan administrasi sekolah.
        </p>
      </div>
    </div>
  );
}
