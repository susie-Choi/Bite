import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-container flex flex-col items-center justify-center pt-20 text-center">
      <span className="text-5xl">🗺️</span>
      <h1 className="mt-6 text-xl font-bold text-text">
        페이지를 찾을 수 없어요
      </h1>
      <p className="mt-2 text-sm text-text-secondary">
        요청하신 페이지가 존재하지 않거나 이동되었습니다.
      </p>
      <Link
        href="/"
        className="btn-primary mt-8 !w-auto !px-8"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
