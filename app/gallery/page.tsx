import Gallery from '../components/Gallery';

export default function GalleryPage() {
  return (
    <main className="min-h-screen bg-white">
      <Gallery />
    </main>
  );
}

export const metadata = {
  title: 'Photo Gallery - SnapSplit',
  description: 'Browse and explore our beautiful photo collection from AWS S3.',
};