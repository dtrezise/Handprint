import { redirect } from "next/navigation";
import { publicHandprintProfile, publicQrState } from "@/lib/handprint-data";

export function generateStaticParams() {
  return [{ publicId: publicQrState.publicId }];
}

export default function HandprintQrRedirectPage({ params }: { params: { publicId: string } }) {
  if (params.publicId === publicQrState.publicId && publicQrState.enabled) {
    redirect(publicHandprintProfile.sharePath);
  }

  redirect("/");
}
