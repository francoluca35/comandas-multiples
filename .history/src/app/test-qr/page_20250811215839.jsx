import QRTest from "../../components/QRTest";

export default function TestQRPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Test de QR</h1>
        <QRTest />
      </div>
    </div>
  );
}
