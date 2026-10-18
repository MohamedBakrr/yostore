import { useDispatch, useSelector } from "react-redux";

/** Typed-style hook wrappers (JavaScript) for dispatching/selecting in components. */
export const useAppDispatch = () => useDispatch();
export const useAppSelector = (selector) => useSelector(selector);
