import React from "react";
import { useForm } from "react-hook-form";

const ContactForm = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Yuborilgan ma'lumot:", data);
    alert("Xabaringiz yuborildi!");
    reset();
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "50px auto",
        padding: "30px",
        border: "1px solid #ddd",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Bizga Ulaning</h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div style={{ marginBottom: "15px" }}>
          <label>Ismingiz</label>
          <input
            {...register("name", { required: "Ism majburiy" })}
            placeholder="Ismingizni kiriting"
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
          {errors.name && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.name.message}</p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <input
            type="email"
            {...register("email", {
              required: "Email majburiy",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Email noto‘g‘ri",
              },
            })}
            placeholder="Email manzilingiz"
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
          {errors.email && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.email.message}</p>
          )}
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Xabaringiz</label>
          <textarea
            {...register("message", { required: "Xabar yozing" })}
            placeholder="Xabar matni"
            rows={5}
            style={{ width: "100%", padding: "10px", marginTop: "5px" }}
          />
          {errors.message && (
            <p style={{ color: "red", marginTop: "5px" }}>{errors.message.message}</p>
          )}
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "5px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Yuborish
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
