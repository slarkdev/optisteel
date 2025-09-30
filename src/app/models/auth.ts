import { Usuario } from "./usuario";

export interface Auth {
  user: Usuario | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  //tipoUsuario: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}