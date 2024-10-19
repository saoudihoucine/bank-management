import { Compte } from "./compte";

export class Transaction {
  montant: number;
  type: 'retrait' | 'dépot' | 'transfert';
  compteRib: string;
  transferRib: string;
  motif: string;
  compte?:Compte
  compteDestinataire?:Compte 
  approuveParChargeId?: number;
  approuveParClientId?: string;
}
