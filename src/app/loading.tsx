export default function Loading() {
  return (
    <div className="page-container flex flex-col items-center justify-center pt-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-500" />
      <p className="mt-4 text-sm text-text-tertiary">로딩 중...</p>
    </div>
  );
}
