export interface User {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: 'ChargeClientele' | 'DirecteurFinancement';
  agenceId: number;
  active?: boolean;
}
