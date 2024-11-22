import { Injectable } from '@angular/core'; // Erlaubt uns, diesen Service in der App zu verwenden
import { HttpClient } from '@angular/common/http'; // Macht HTTP-Anfragen möglich
import { Observable } from 'rxjs'; // Typ für den Datenstrom (Observable)


@Injectable({
  providedIn: 'root' // Macht den Service überall verfügbar, ohne ihn manuell zu registrieren
})
export class SwimService {
  constructor(private http: HttpClient) { }   // `http` ist eine Instanz von HttpClient, mit der wir HTTP-Anfragen machen können.


  // Methode lädt die SchwimmClubZeiten
  getSwimClubTimes(): Observable<any> {
    // Wir nutzen HTTP, um die JSON-Datei zu laden.
    // Das Ergebnis ist ein Observable, das die Daten enthält.
    return this.http.get('assets/swim-club-times.json');  // Pfad zur JSON-Datei
  }
}
