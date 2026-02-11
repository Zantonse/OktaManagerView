import { CertificationsContent } from "@/components/certifications/certifications-content";

export default function CertificationsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Certifications</h1>
        <p className="text-muted-foreground">Review and attest pending certification tasks</p>
      </div>

      <CertificationsContent />
    </div>
  );
}
