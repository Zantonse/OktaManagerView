export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#f4f4f4]">
      <div className="relative z-10">
        {children}
      </div>
      <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center">
        <span className="text-xs text-[#6e6e78]">Powered by Okta</span>
      </div>
    </div>
  );
}
