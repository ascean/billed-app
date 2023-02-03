/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";

import router from "../app/Router.js";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import mockStore from "../__mocks__/store.js";
import { newbill } from "../fixtures/newBill.js";

import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        test("Then mail icon in vertical layout should be highlighted", async () => {
            //recup localStorageMock
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            //définit le localStorage avec les données user
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.NewBill);
            await waitFor(() => screen.getByTestId("icon-mail"));
            const mailIcon = screen.getByTestId("icon-mail");
            //-----ADD-ONS expect expression
            expect(mailIcon).toHaveClass("active-icon");
            //-----ADD-ONS
        });

        test("Then form should be displayed", () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
            expect(screen.getByTestId("btn-send-bill")).toBeTruthy();
        });
    });
});

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page and I select a file", () => {
        beforeEach(() => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            //to-do write assertion
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "test@test.fr",
                })
            );
        });

        test("Then file should be a image file", () => {
            jest.mock("../app/Store.js", () => mockStore);

            const newBillContainer = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            //récup input file + verif existence
            const inputFile = screen.getByTestId("file");
            expect(inputFile).toBeTruthy();

            // création d'un fichier de type jpg à tester
            const testFile = new File(["facture.jpg"], "facture.jpg", {
                type: "image/jpg",
            });

            //création de la fonction à tester
            const handleChangeFile = jest.fn((e) =>
                newBillContainer.handleChangeFile(e)
            );

            //ajout de la fonction à tester sur le listener du bouton
            inputFile.addEventListener("change", handleChangeFile);

            //upload du fichier test
            userEvent.upload(inputFile, testFile);

            //Vérifier si la fonction simulée a été appelée
            expect(handleChangeFile).toHaveBeenCalled();

            //contrôle du type de fichier
            expect(inputFile.files[0].type).toMatch(/jpeg|jpg|png/);
        });

        test("Then an alert message should be displayed if file is not a image file", () => {
            const newBillContainer = new NewBill({
                document,
                onNavigate,
                store: null,
                localStorage: window.localStorage,
            });

            //récup input file + verif existence
            const inputFile = screen.getByTestId("file");
            expect(inputFile).toBeTruthy();

            // création d'un fichier de type jpg à tester
            const testFile = new File(["facture.pdf"], "facture.pdf", {
                type: "application/pdf",
            });

            window.alert = jest.fn();

            //création de la fonction à tester
            const handleChangeFile = jest.fn((e) =>
                newBillContainer.handleChangeFile(e)
            );

            //ajout de la fonction à tester sur le listener du bouton
            inputFile.addEventListener("change", handleChangeFile);

            //upload du fichier test
            userEvent.upload(inputFile, testFile);

            //Vérifier si la fonction simulée a été appelée
            expect(handleChangeFile).toHaveBeenCalled();

            //contrôle du type de fichier
            expect(inputFile.files[0].type).not.toMatch(/jpeg|jpg|png/);
            expect(window.alert).toHaveBeenCalledWith(
                "Seuls les fichiers de type image sont autorisés (jpg, jpeg ou png)"
            );
            window.alert.mockClear();
        });
    });
});

//Test intégration POST new bill
describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page and I click on submit button", () => {
        test("Then a new bill is created", async () => {
            const html = NewBillUI();
            document.body.innerHTML = html;

            jest.mock("../app/Store.js", () => mockStore);
            // défini le chemin d'accès

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            //to-do write assertion
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "test@newbill.fr",
                })
            );

            const newBillContainer = new NewBill({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // charge les données dans le formulaire
            screen.getByTestId("expense-type").value = newbill[0].type;
            screen.getByTestId("expense-name").value = newbill[0].name;
            screen.getByTestId("datepicker").value = newbill[0].date;
            screen.getByTestId("amount").value = newbill[0].amount;
            screen.getByTestId("vat").value = newbill[0].vat;
            screen.getByTestId("pct").value = newbill[0].pct;
            screen.getByTestId("commentary").value = newbill[0].commentary;
            newBillContainer.fileName = newbill[0].fileName;
            newBillContainer.fileUrl = newbill[0].fileUrl;

            //surveille la fonction updateBill()
            const updateBill = jest.spyOn(newBillContainer, "updateBill");

            //simule la fonction handleSubmit()
            const handleSubmit = jest.fn((e) =>
                newBillContainer.handleSubmit(e)
            );

            //affecte la fonction au submit du form et simule la soumission
            const form = screen.getByTestId("form-new-bill");
            expect(form).toBeTruthy();
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            //vérification de l'appel des fonctions
            expect(handleSubmit).toHaveBeenCalled();
            expect(updateBill).toHaveBeenCalled();
        });
    });
});

describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to New Bill and an error occurs on API", () => {
        beforeEach(() => {
            jest.spyOn(mockStore, "bills");

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "a@a",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.appendChild(root);
            router();
        });
        //test API error 404
        test("fetches bills from an API and fails with 404 message error", async () => {
            //remplace l'implémentation de mockStore.bills() afin qu'elle retourne une promesse rejetée avec message d'erreur
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"));
                    },
                };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            document.body.innerHTML = BillsUI({ error: "Erreur 404" });
            // //verification de la présence du texte Erreur
            const message = screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });

        //test API error 500
        test("fetches messages from an API and fails with 500 message error", async () => {
            //remplace l'implémentation de mockStore.bills() afin qu'elle retourne une promesse rejetée avec message d'erreur
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"));
                    },
                };
            });

            window.onNavigate(ROUTES_PATH.NewBill);
            await new Promise(process.nextTick);
            document.body.innerHTML = BillsUI({ error: "Erreur 500" });
            // //verification de la présence du texte Erreur
            const message = screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});
