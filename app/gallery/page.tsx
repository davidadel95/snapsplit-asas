import ProtectedGallery from '../components/ProtectedGallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white">
      <ProtectedGallery />
    </main>
  );
}

export const metadata = {
  title: 'Photo Gallery - SnapSplit',
  description: 'Browse and explore our beautiful photo collection from AWS S3.',
};