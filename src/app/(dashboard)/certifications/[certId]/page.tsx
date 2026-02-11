import { CertificationDetail } from "@/components/certifications/certification-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CertificationDetailPageProps {
  params: Promise<{ certId: string }>;
}

export default async function CertificationDetailPage({ params }: CertificationDetailPageProps) {
  const { certId } = await params;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-2">
        <Link href="/certifications">
          <Button variant="ghost" className="w-fit px-0 h-auto text-muted-foreground hover:text-foreground">
            ← Back to Certifications
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Certification Details</h1>
      </div>

      <CertificationDetail certId={certId} />
    </div>
  );
}
