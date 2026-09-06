import axiosClient from "./axiosClient";

export const fetchTransactions = async (filters) => {
  const { data } = await axiosClient.get("/transactions", { params: filters });
  return data;
};

export const getTransactions = fetchTransactions;

export const createTransaction = async (transactionData) => {
  const { data } = await axiosClient.post("/transactions", transactionData);
  return data;
};

export const deleteTransaction = async (id) => {
  const { data } = await axiosClient.delete(`/transactions/${id}`);
  return data;
};
