import Image from "next/image";

export function PhotoGallery({ photos }: { photos: string[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {photos.map((photo, index) => (
        <div key={photo} className={`relative overflow-hidden rounded-[24px] ${index === 0 ? "md:col-span-2" : ""}`}>
          <div className={`relative min-h-60 ${index === 0 ? "md:min-h-80" : ""}`}>
            <Image src={photo} alt={`Foto ${index + 1}`} fill className="object-cover" />
          </div>
        </div>
      ))}
    </div>
  );
}
