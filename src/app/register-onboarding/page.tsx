"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

const steps = [
	{
		title: "Datos Básicos",
		fields: [
			{ label: "Nombre completo", name: "name", type: "text" },
			{ label: "Correo electrónico", name: "email", type: "email" },
			{ label: "Teléfono", name: "phone", type: "tel" },
		],
	},
	{
		title: "Tipo de Establecimiento",
		fields: [
			{
				label: "Selecciona el tipo de establecimiento",
				name: "businessType",
				type: "select-cards",
				options: [
					{ label: "Discoteca", value: "discoteca" },
					{ label: "Bar", value: "bar" },
					{ label: "Gimnasio", value: "gimnasio" },
					{ label: "Restaurante", value: "restaurante" },
					{ label: "Teatro", value: "teatro" },
				],
			},
		],
	},
	{
		title: "Rol en la Empresa",
		fields: [
			{
				label: "¿Eres dueño del establecimiento?",
				name: "isOwner",
				type: "radio",
				options: [
					{ label: "Sí", value: "owner" },
					{ label: "No, soy empleado", value: "employee" },
					{ label: "Consultor externo", value: "consultant" },
				],
			},
			{
				label: "Cargo o rol",
				name: "role",
				type: "text",
			},
		],
	},
	{
		title: "Información Adicional",
		fields: [
			{ label: "Nombre del establecimiento", name: "businessName", type: "text" },
			{ label: "Ciudad", name: "city", type: "text" },
		],
	},
];

const variants = {
	initial: { opacity: 0, x: 80 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -80 },
};
export default function RegisterOnboardingPage() {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<any>({});
    const totalSteps = steps.length;
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev: any) => ({
            ...prev,
            [name]: type === "radio" ? value : value,
        }));
    };

    const handleNext = () => {
        if (step < totalSteps - 1) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 0) setStep(step - 1);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("¡Onboarding completado!\n" + JSON.stringify(form, null, 2));
        router.push("/home");
    };

    return (
        <div className="min-h-screen flex bg-white">
            {/* Columna izquierda: Wizard */}
            <div className="w-2/3 flex flex-col justify-center items-center relative">
                {/* Logo */}
                <div className="ml-15 top-0 w-full flex mt-10">
                    <Image
                        src="/assets/images/insonor.png"
                        alt="Logo"
                        width={150}
                        height={70}
                        className="mb-8"
                    />
                </div>

                {/* Progress bar fija */}
                <div className="w-full flex justify-center mt-20 mb-8">
                    <div className="w-[520px] flex items-center gap-4">
                        <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-black rounded-full"
                                initial={false}
                                animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 min-w-max">
                            Paso {step + 1} de {totalSteps}
                        </span>
                    </div>
                </div>

                {/* Formulario centrado y más ancho */}
                <div className="w-full flex justify-center items-center min-h-[660px]">
                    <form
                        className="w-full max-w-2xl bg-white px-16 py-12 flex flex-col gap-10"
                        onSubmit={handleSubmit}
                        autoComplete="off"
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={variants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.4 }}
                                className="flex flex-col gap-8"
                            >
                                <h2 className="text-2xl font-semibold text-center mb-2 text-neutral-900">{steps[step].title}</h2>
                                <div className="flex flex-col gap-6">
                                    {steps[step].fields.map((field) => (
                                        <div key={field.name} className="w-full">
                                            <label className="block mb-2 text-base text-neutral-800" htmlFor={field.name}>
                                                {field.label}
                                            </label>
                                            {field.type === "radio" ? (
                                                <div className="flex gap-6">
                                                    {field.options?.map((opt: any) => (
                                                        <label key={opt.value} className="flex items-center gap-2 text-neutral-700">
                                                            <input
                                                                type="radio"
                                                                name={field.name}
                                                                value={opt.value}
                                                                checked={form[field.name] === opt.value}
                                                                onChange={handleChange}
                                                                className="accent-black w-5 h-5"
                                                            />
                                                            <span>{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            ) : field.type === "select-cards" ? (
                                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                                                    {field.options?.map((opt: any) => (
                                                        <button
                                                            type="button"
                                                            key={opt.value}
                                                            className={`rounded-xl border-2 px-8 py-8 text-lg font-medium shadow-sm transition flex flex-col items-center justify-center
                                                                ${form[field.name] === opt.value
                                                                    ? "border-black bg-neutral-100"
                                                                    : "border-neutral-200 bg-white hover:border-black"}`}
                                                            onClick={() =>
                                                                setForm((prev: any) => ({
                                                                    ...prev,
                                                                    [field.name]: opt.value,
                                                                }))
                                                            }
                                                        >
                                                            <span>{opt.label}</span>
                                                            {form[field.name] === opt.value && (
                                                                <span className="block mt-2 text-xs bg-black text-white px-2 py-1 rounded">Seleccionado</span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <input
                                                    id={field.name}
                                                    name={field.name}
                                                    type={field.type}
                                                    value={form[field.name] || ""}
                                                    onChange={handleChange}
                                                    className="w-full border border-neutral-400 rounded-md px-4 py-3 bg-neutral-100 text-neutral-900 text-base outline-none focus:border-black transition"
                                                    required
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {/* Botones */}
                        <div className="flex justify-between items-center mt-4">
                            {step > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="text-neutral-700 text-base underline underline-offset-4"
                                >
                                    Atrás
                                </button>
                            ) : <div />}
                            {step < totalSteps - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="text-lg font-semibold bg-black text-white rounded-md px-8 py-2 shadow hover:bg-neutral-800 transition"
                                >
                                    Siguiente
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    className="text-lg font-semibold bg-black text-white rounded-md px-8 py-2 shadow hover:bg-neutral-800 transition"
                                >
                                    Finalizar
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>

            {/* Columna derecha: Imagen */}
            <div className="w-1/3 min-h-screen relative">
                <Image
                    src="/assets/images/onm.png"
                    alt="Onboarding"
                    fill
                    style={{ objectFit: "cover" }}
                    className="opacity-100"
                    priority
                />
            </div>
        </div>
    );
}