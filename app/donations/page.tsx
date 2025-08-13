'use client';
import React, { useRef, useState } from "react";
import { db, storage } from "@/app/firebase/config";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const initialForm = {
  familyName: "",
  fatherInitial: "",
  firstName: "",
  cnp: "",
  email: "",
  phone: "",
  locality: "",
  county: "",
  street: "",
  number: "",
  block: "",
  staircase: "",
  floor: "",
  apartment: "",
  postalCode: "",
  redirect2Years: "DA",
};

export const DonationsPage: React.FC = () => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState<{x: number, y: number} | null>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    setLastPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };
  const handleCanvasMouseUp = () => setDrawing(false);
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx || !lastPos) return;
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
    setLastPos({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
  };
  const handleClearSignature = () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setSignatureUrl("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let signatureDownloadUrl = "";
    try {
      if (canvasRef.current) {
        const dataUrl = canvasRef.current.toDataURL("image/png");
        if (dataUrl && dataUrl !== "data:,") {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const storageRef = ref(storage, `donationForms/signatures/${Date.now()}.png`);
          await uploadBytes(storageRef, blob);
          signatureDownloadUrl = await getDownloadURL(storageRef);
        }
      }
      await addDoc(collection(db, "donationForms230"), {
        ...form,
        signatureUrl: signatureDownloadUrl,
        submittedAt: new Date().toISOString(),
      });
      setSuccess(true);
      setForm(initialForm);
      handleClearSignature();
    } catch (err) {
      alert("A apărut o eroare. Încearcă din nou!");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 flex mt-15 flex-col items-center justify-center p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Donează pentru JoyForEveryone</h2>
        <p className="text-center text-gray-300 mb-6">
          Poți susține ONG-ul nostru direct prin transfer bancar:
        </p>
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-center">
          <span className="font-semibold text-cyan-400">IBAN:</span>
          <br />
          <span className="text-lg font-mono text-white">RO76BTRLRONCRT0607657602</span>
          <br />
          <span className="text-sm text-gray-400">Banca Transilvania</span>
        </div>
        <h1>SAU...</h1>
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">Formularul 230: Redirecționează 3.5% din impozit</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="familyName" required placeholder="Numele de familie *" value={form.familyName} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="fatherInitial" placeholder="Inițiala tatălui" value={form.fatherInitial} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="firstName" required placeholder="Prenume *" value={form.firstName} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" name="cnp" required placeholder="CNP *" value={form.cnp} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="email" name="email" placeholder="Adresa Email" value={form.email} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="phone" placeholder="Număr de telefon" value={form.phone} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="font-semibold mt-4 mb-2">Adresa:</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="locality" required placeholder="Localitate *" value={form.locality} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="county" required placeholder="Județ *" value={form.county} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="street" required placeholder="Strada *" value={form.street} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="number" required placeholder="Număr *" value={form.number} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" name="block" placeholder="Bloc" value={form.block} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="staircase" placeholder="Scară" value={form.staircase} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="floor" placeholder="Etaj" value={form.floor} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
            <input type="text" name="apartment" placeholder="Apartament" value={form.apartment} onChange={handleChange} className="p-2 rounded bg-gray-800 text-white" />
          </div>
          <input type="text" name="postalCode" placeholder="Cod Poștal" value={form.postalCode} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 text-white" />
          <div className="mt-4">
            <span className="font-semibold">Vreau să redirecționez pe perioada de 2 ani:</span>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center">
                <input type="radio" name="redirect2Years" value="DA" checked={form.redirect2Years === "DA"} onChange={handleChange} className="mr-2" />
                DA
              </label>
              <label className="flex items-center">
                <input type="radio" name="redirect2Years" value="NU" checked={form.redirect2Years === "NU"} onChange={handleChange} className="mr-2" />
                NU
              </label>
            </div>
          </div>
          <div className="mt-4">
            <span className="font-semibold">Semnătură:</span>
            <div className="border rounded bg-white p-2">
              <canvas
                ref={canvasRef}
                width={400}
                height={120}
                style={{ background: "#fff", border: "1px solid #ccc", cursor: "crosshair" }}
                onMouseDown={handleCanvasMouseDown}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onMouseMove={handleCanvasMouseMove}
              />
            </div>
            <button type="button" onClick={handleClearSignature} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded">
              ȘTERGE SEMNĂTURA
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition mt-4"
          >
            {loading ? "Se trimite..." : "GENEREAZĂ FORMULAR"}
          </button>
        </form>
        {success && (
          <p className="text-green-400 mt-4 text-center">
            Formularul a fost trimis cu succes! Vă vom contacta în curând.
          </p>
        )}
      </div>
    </main>
  );
};

export default DonationsPage;