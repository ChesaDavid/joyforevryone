import { PDFDocument } from "pdf-lib";
import { getStorage, ref, uploadBytes } from "firebase/storage";
interface Form230Data {
  familyName: string;
  fatherInitial: string;
  firstName: string;
  cnp: string;
  email: string;
  phone: string;
  locality: string;
  county: string;
  street: string;
  number: string;
  block: string;
  staircase: string;
  floor: string;
  apartment: string;
  postalCode: string;
  redirect2Years: string;
}

function removeDiacritics(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}


export async function fillForm230(formData: Form230Data, signatureFile: HTMLCanvasElement) {
  // Load the official ANAF form230.pdf
  const existingPdfBytes = await fetch("/Formular230.pdf").then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();
  const cnp = removeDiacritics(formData.cnp);
  // Fill text fields (replace with actual PDF field names)
  form.getTextField("Nume").setText(removeDiacritics(formData.familyName));
  form.getTextField("Prenume").setText(removeDiacritics(formData.firstName));
  form.getTextField("InitialaTatalui").setText(removeDiacritics(formData.fatherInitial)); 
  
  for (let i = 0; i < cnp.length && i < 13; i++) {
    form.getTextField(`CNP${i + 1}`).setText(cnp[i]);
  }
  form.getTextField("Email").setText(removeDiacritics(formData.email));
  form.getTextField("Telefon").setText(removeDiacritics(formData.phone));

  form.getTextField("Localitate").setText(removeDiacritics(formData.locality));
  form.getTextField("Judet").setText(removeDiacritics(formData.county));
  form.getTextField("Strada").setText(removeDiacritics(formData.street));
  form.getTextField("Numar").setText(removeDiacritics(formData.number));
  form.getTextField("Bloc").setText(removeDiacritics(formData.block));
  form.getTextField("Scara").setText(removeDiacritics(formData.staircase));
  form.getTextField("Etaj").setText(removeDiacritics(formData.floor));
  form.getTextField("Apartament").setText(removeDiacritics(formData.apartment));
  form.getTextField("CodPostal").setText(removeDiacritics(formData.postalCode));

  if (formData.redirect2Years === "DA") {
    form.getCheckBox("Redirect2Ani").check();
  }

  // Convert signature canvas to PNG
  const blob = await new Promise<Blob>((resolve) =>
    signatureFile.toBlob((b) => resolve(b!), "image/png")
  );
  const signatureBytes = await blob.arrayBuffer();
  const signatureImage = await pdfDoc.embedPng(signatureBytes);

  // Get the page where the signature should appear
  // ⚠️ Adjust page index if signature is on another page (0 = first page)
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Choose coordinates (x, y) and size
  // You’ll need to experiment with these numbers until the signature sits correctly
  const signatureDims = signatureImage.scale(0.3); // scale down image if needed
  const x = 150; // distance from left (in PDF points)
  const y = 130; // distance from bottom (in PDF points)

  // Draw signature on PDF
  firstPage.drawImage(signatureImage, {
    x,
    y,
    width: signatureDims.width,
    height: signatureDims.height,
  });

  // Get final PDF bytes
  const pdfBytes = await pdfDoc.save();

  // Upload to Firebase Storage
  const storage = getStorage();
  const storageRef = ref(storage, `forms/form230-${formData.cnp}.pdf`);
  await uploadBytes(storageRef, pdfBytes, { contentType: "application/pdf" });
  return `forms/form230-${formData.cnp}.pdf`;
}
