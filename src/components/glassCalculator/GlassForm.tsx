// components/glassCalculator/GlassForm.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import {
  FamilyUI, PayloadFinish, PayloadColor, UiColor, Finish,
  THICKNESS_BY_FAMILY_UI, getAvailableFinishes, getAvailableColors,
  mapUiColorToPayload, UI_SERVICES, buildServicesPayload, buildDescription,
} from "./helpers";

type Props = {
  companyId: number;
  onAddItem: (item: {
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }) => void;
};

export default function GlassForm({ companyId, onAddItem }: Props) {
  // ===== Estado
  const [familyUI, setFamilyUI] = React.useState<FamilyUI>("PLANO");
  const [thickness, setThickness] = React.useState<number>(6);

  const [finish, setFinish] = React.useState<Finish>("POLARIZADO");
  const [uiColor, setUiColor] = React.useState<UiColor>("AMBAR");

  const [catedralColorLibre, setCatedralColorLibre] = React.useState<string>("");

const [anchoCm, setAnchoCm] = React.useState<number>(0);
const [altoCm, setAltoCm] = React.useState<number>(0);
const [qty, setQty] = React.useState<number>(1);



 
  const [svcState, setSvcState] = React.useState<Record<string, { enabled: boolean; qty?: number }>>({
    CORTE_ESPECIAL: { enabled: false },
    PERFORACION: { enabled: false, qty: 1 },
    CANTO_PULIDO: { enabled: true },
    CANTO_BISEL: { enabled: false },
  });

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);



  // NUEVO:
const [computing, setComputing] = React.useState(false);
const [preview, setPreview] = React.useState<{
  unitPrice: number;
  unit: string;
  description: string;
  subtotal: number;
} | null>(null);





  // ===== Reglas derivadas (SIN CAMBIAR COMPORTAMIENTO)
  React.useEffect(() => {
    const allowed = THICKNESS_BY_FAMILY_UI[familyUI];
    if (!allowed.includes(thickness)) setThickness(allowed[0]);
  }, [familyUI]); // eslint-disable-line

  const availableFinishes = React.useMemo(
    () => getAvailableFinishes(familyUI, thickness),
    [familyUI, thickness]
  );
  React.useEffect(() => {
    if (!availableFinishes.includes(finish)) setFinish(availableFinishes[0]);
  }, [availableFinishes]); // eslint-disable-line

  const availableColors = React.useMemo(
    () => getAvailableColors(familyUI, finish, thickness),
    [familyUI, finish, thickness]
  );
  React.useEffect(() => {
    if (!availableColors.includes(uiColor)) setUiColor(availableColors[0]);
  }, [availableColors]); // eslint-disable-line

  const isCatedral = familyUI === "CATEDRAL";
  const isTemplado = familyUI === "TEMPLADO";
  const isReflejante = familyUI === "REFLEJANTE";

  const finishDisabled = false; // (conservamos tu UI actual)
  const showCatedralColorLibre = isCatedral && finish === "COLOR";
  const colorDisabled = availableColors.length === 1 && availableColors[0] === "NONE";



  // 🔧 Builder del payload para cálculo automático (se usará en el paso 3)
function buildCalcBody() {
  const isCatedralLocal = familyUI === "CATEDRAL";
  const isTempladoLocal = familyUI === "TEMPLADO";
  const isReflejanteLocal = familyUI === "REFLEJANTE";

  // El backend no conoce "COLOR" en Catedral ⇒ finish va como undefined en ese caso
  const finishPayload: PayloadFinish | undefined =
    isCatedralLocal ? (finish === "COLOR" ? undefined : (finish as PayloadFinish))
                    : (finish as PayloadFinish);

  // Recalcular colores válidos localmente para decidir si va NONE
  const colors = getAvailableColors(familyUI, finish, thickness);
  const colorIsDisabled = colors.length === 1 && colors[0] === "NONE";

  const { payload: colorPayload, describeOnly } = mapUiColorToPayload(uiColor);

  return {
    body: {
      companyId,
      family: (isCatedralLocal ? "CATEDRAL" : familyUI) as "PLANO" | "CATEDRAL" | "TEMPLADO" | "REFLEJANTE",
      thicknessMM: thickness,
      finish: finishPayload,
      color: colorIsDisabled ? ("NONE" as PayloadColor) : (colorPayload as PayloadColor),
      anchoCm,
      altoCm,
      services: buildServicesPayload(svcState as any),
    },
    describeOnly,
    isCatedral: isCatedralLocal,
    isTemplado: isTempladoLocal,
    isReflejante: isReflejanteLocal,
  };
}



// 🌀 Cálculo automático cuando cambian entradas
React.useEffect(() => {
  // Validación mínima: evita llamar si no hay datos suficientes
  if (anchoCm <= 0 || altoCm <= 0 || qty <= 0) {
    setPreview(null);
    return;
  }

  const { body, describeOnly, isCatedral, isTemplado, isReflejante } = buildCalcBody();
  let ignore = false;

  if (!companyId || anchoCm <= 0 || altoCm <= 0 || qty <= 0) {
  setPreview(null);
  return;
}


  // ⏳ Espera 250ms tras el último cambio antes de calcular
  const t = setTimeout(async () => {
    setComputing(true);
    setErrorMsg(null);

    try {
      // DEBUG (quitar luego)
      console.log("[calc] body:", body);

      const res = await fetch("/api/pricing/glass/calc", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// Lee el body una sola vez
const raw = await res.text();
if (!res.ok) {
  // Intenta parsear para mostrar el mensaje del backend
  let errMsg = "No se pudo calcular el precio.";
  try {
    const j = JSON.parse(raw);
    if (j?.error) errMsg = j.error;
  } catch {
    if (raw) errMsg = raw;
  }
  if (!ignore) {
    setPreview(null);
    setErrorMsg(errMsg);
  }
  return; // 🚫 Importante: salir sin llamar a JSON otra vez
}

const data = JSON.parse(raw);

const unitPrice = Number(data.total);
const unit = String(data.unit ?? "UNIDAD");
const descBase = String(data.description ?? "Vidrio");

const desc = buildDescription(descBase, {
  isTemplado,
  isCatedral,
  isReflejante,
  finish,
  catedralColorLibre,
  uiColor,
  describeOnly,
});

const subtotal = Number((unitPrice * qty).toFixed(2));
if (!ignore) {
  setPreview({ unitPrice, unit, description: desc, subtotal });
}


      
    } catch (e: any) {
      if (!ignore) {
        setPreview(null);
        setErrorMsg(e?.message ?? "Error de red o del servidor.");
      }
    } finally {
      if (!ignore) setComputing(false);
    }
  }, 250); // debounce 250ms

  return () => {
    ignore = true;
    clearTimeout(t);
  };

// 🧮 Dependencias: todo lo que afecta el cálculo
}, [companyId, familyUI, thickness, finish, uiColor, catedralColorLibre, anchoCm, altoCm, qty, svcState]);






  // ===== Submit (misma lógica)
/* 🟢 NUEVO handleSubmit: solo agrega usando la preview */
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setErrorMsg(null);

  if (!preview) {
    setErrorMsg("Aún no hay cálculo disponible.");
    return;
  }

  onAddItem({
    description: preview.description,
    unit: preview.unit,
    quantity: qty,
    unitPrice: preview.unitPrice,
    subtotal: preview.subtotal,
  });
}



  // ===== Handlers UI servicios (sin cambios)
  function toggleService(key: string, enabled: boolean) {
    setSvcState((prev) => ({ ...prev, [key]: { ...prev[key], enabled } }));
  }
  function changeServiceQty(key: string, qty: number) {
    setSvcState((prev) => ({ ...prev, [key]: { ...prev[key], qty } }));
  }

  // ===== UI
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fila 1: Familia & Espesor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Familia</label>
          <select
            value={familyUI}
            onChange={(e) => setFamilyUI(e.target.value as FamilyUI)}
            className="rounded-md border px-3 py-2 text-sm"
          >
            <option value="PLANO">PLANO</option>
            <option value="CATEDRAL">CATEDRAL</option>
            <option value="TEMPLADO">TEMPLADO</option>
            <option value="REFLEJANTE">REFLEJANTE</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Espesor (mm)</label>
          <select
            value={thickness}
            onChange={(e) => setThickness(Number(e.target.value))}
            className="rounded-md border px-3 py-2 text-sm"
          >
            {THICKNESS_BY_FAMILY_UI[familyUI].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {familyUI === "PLANO" && finish === "POLARIZADO" && thickness < 4 && (
            <span className="mt-1 text-xs text-red-500">* Polarizado sólo disponible desde 4 mm.</span>
          )}
        </div>
      </div>

      {/* Fila 2: Acabado & Color */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Acabado</label>
          <select
            value={finish}
            onChange={(e) => setFinish(e.target.value as Finish)}
            className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
            disabled={finishDisabled}
          >
            {getAvailableFinishes(familyUI, thickness).map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          {familyUI === "REFLEJANTE" && (
            <span className="mt-1 text-xs text-gray-400">* Reflejante tiene acabado fijo.</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Color</label>
          <select
            value={uiColor}
            onChange={(e) => setUiColor(e.target.value as UiColor)}
            className="rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
            disabled={colorDisabled}
          >
            {availableColors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {familyUI === "PLANO" && finish === "POLARIZADO" && thickness < 4 && (
            <span className="mt-1 text-xs text-red-500">* Polarizado sólo ≥ 4 mm.</span>
          )}
        </div>
      </div>

      {/* Fila 2.5 (sólo CATEDRAL con COLOR): Color libre */}
      {isCatedral && finish === "COLOR" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Color (texto libre)</label>
          <input
            type="text"
            placeholder="Ej.: Gris humo, Ámbar claro…"
            value={catedralColorLibre}
            onChange={(e) => setCatedralColorLibre(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm"
          />
          <span className="mt-1 text-xs text-gray-400">* Se añadirá a la descripción (no afecta precio).</span>
        </div>
      )}

      {/* Fila 3: Dimensiones y cantidad */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Ancho (cm)</label>
          <input
            type="number" min={1} step="1" value={anchoCm}
            onChange={(e) => setAnchoCm(Number(e.target.value))}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Alto (cm)</label>
          <input
            type="number" min={1} step="1" value={altoCm}
            onChange={(e) => setAltoCm(Number(e.target.value))}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Cantidad</label>
          <input
            type="number" min={1} step="1" value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="rounded-md border px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Fila 4: Servicios */}
      <div className="space-y-3 pt-2">
        <div className="text-sm font-medium">Servicios adicionales</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Corte especial */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!(svcState as any).CORTE_ESPECIAL?.enabled}
                onChange={(e) =>
                  setSvcState((p) => ({ ...p, CORTE_ESPECIAL: { ...p.CORTE_ESPECIAL, enabled: e.target.checked } }))
                }
              />
              Corte especial
            </label>
          </div>

          {/* Perforaciones */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!(svcState as any).PERFORACION?.enabled}
                onChange={(e) =>
                  setSvcState((p) => ({ ...p, PERFORACION: { ...p.PERFORACION, enabled: e.target.checked } }))
                }
              />
              Perforaciones
            </label>
            <input
              type="number"
              min={1}
              step="1"
              value={(svcState as any).PERFORACION?.qty ?? 1}
              onChange={(e) =>
                setSvcState((p) => ({ ...p, PERFORACION: { ...p.PERFORACION, qty: Number(e.target.value) } }))
              }
              disabled={!(svcState as any).PERFORACION?.enabled}
              className="w-24 rounded-md border px-3 py-2 text-sm disabled:bg-gray-100"
            />
          </div>

          {/* Pulido */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!(svcState as any).CANTO_PULIDO?.enabled}
                onChange={(e) =>
                  setSvcState((p) => ({ ...p, CANTO_PULIDO: { ...p.CANTO_PULIDO, enabled: e.target.checked } }))
                }
              />
              Pulido (por ft²)
            </label>
          </div>

          {/* Bordeado/Bisel */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!(svcState as any).CANTO_BISEL?.enabled}
                onChange={(e) =>
                  setSvcState((p) => ({ ...p, CANTO_BISEL: { ...p.CANTO_BISEL, enabled: e.target.checked } }))
                }
              />
              Bordeado / Bisel (por ft²)
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-400">
          * Si no existe tarifa para algún servicio seleccionado, simplemente no se aplicará costo.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMsg}
        </div>
      )}



{/* 💰 Panel: costo en vivo (pegar encima del botón) */}
<div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
  <div className="text-sm text-gray-600">
    {computing ? (
      "Calculando…"
    ) : preview ? (
      <>
        <span className="mr-4">
          Precio unitario:{" "}
          <strong>
            S/. {preview.unitPrice.toFixed(2)} / {preview.unit}
          </strong>
        </span>
        <span>
          Subtotal × {qty}: <strong>S/. {preview.subtotal.toFixed(2)}</strong>
        </span>
      </>
    ) : (
      "Ingresa medidas y opciones para calcular."
    )}
  </div>
</div>







<div className="pt-1">
  <Button
    className="w-full"
    size="md"
    tone="primary"
    variant="solid"
    action="add"
    /* usa el estado del cálculo automático */
    loading={computing}
    type="submit"
    disabled={computing || !preview}
  >
    Agregar
  </Button>
</div>




    </form>
  );
}

