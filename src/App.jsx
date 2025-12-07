import React from "react";

export default function App() {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
        Ofertas da Semana
      </h1>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* CARD 1 */}
        <div
          style={{
            width: "280px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="https://via.placeholder.com/300x200/ffffff?text=Ofertas+Especiais"
            alt="Ofertas Especiais"
            style={{ width: "100%", display: "block" }}
          />
          <div style={{ padding: "15px", textAlign: "center" }}>
            <h3>Ofertas Especiais</h3>
          </div>
        </div>

        {/* CARD 2 */}
        <div
          style={{
            width: "280px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="https://via.placeholder.com/300x200/ffffff?text=Farmacia+Saude"
            alt="Farmácia Saúde"
            style={{ width: "100%", display: "block" }}
          />
          <div style={{ padding: "15px", textAlign: "center" }}>
            <h3>Farmácia Saúde</h3>
          </div>
        </div>

        {/* CARD 3 */}
        <div
          style={{
            width: "280px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <img
            src="https://via.placeholder.com/300x200/ffffff?text=Supermercado+Bom+Preco"
            alt="Supermercado Bom Preço"
            style={{ width: "100%", display: "block" }}
          />
          <div style={{ padding: "15px", textAlign: "center" }}>
            <h3>Supermercado Bom Preço</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
