import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../features/tickets/ticketSlice";
import BackButton from "../components/BackButton";

function NewTicket() {
  const { user } = useSelector((state) => state.auth);
  const [name] = useState(user.name);
  const [email] = useState(user.email);
  const [product, setProduct] = useState("iPhone");
  const [description, setDescription] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createTicket({ product, description }))
      .unwrap()
      .then(() => {
        toast.success("New ticket created");
        navigate("/tickets");
      })
      .catch((error) => {
        toast.error(error);
      });
  };
  return (
    <>
      <BackButton />
      <section className="heading">
        <h1>Create new ticket</h1>
        <p>Please fill out the form below.</p>
      </section>
      <section className="form">
        <div className="form-group">
          <label htmlFor="name">Customer name</label>
          <input type="text" className="form-control" value={name} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="email">Customer email</label>
          <input type="text" className="form-control" value={email} disabled />
        </div>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="product">Product</label>
            <select
              name="product"
              id="product"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            >
              <option value={"iPhone"}>iPhone</option>
              <option value={"iPad"}>iPad</option>
              <option value={"MacBook Pro"}>MacBook Pro</option>
              <option value={"iMac"}>iMac</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description of the issue</label>
            <textarea
              name="description"
              id="description"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: "none" }}
            />
          </div>
          <div className="form-control">
            <button className="btn btn-block">Submit</button>
          </div>
        </form>
      </section>
    </>
  );
}

export default NewTicket;
