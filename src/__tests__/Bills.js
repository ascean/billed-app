/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
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
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");

            //-----ADD-ONS expect expression
            expect(windowIcon).toHaveClass("active-icon");
            //-----ADD-ONS
        });

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen
                .getAllByText(
                    /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
                )
                .map((a) => a.innerHTML);
            const antiChrono = (a, b) => (a < b ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            expect(dates).toEqual(datesSorted);
        });
    });

    describe("When I am on Bills page but it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = BillsUI({ loading: true });
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });
    });
    describe("When I am on Bills page but back-end send an error message", () => {
        test("Then, Error page should be rendered", () => {
            document.body.innerHTML = BillsUI({ error: "some error message" });
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });

    describe("When I am on Bills page and I click on new bill button", () => {
        test("It should render new bill page", async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );

            const billsContainer = new Bills({
                document,
                onNavigate,
                store: null,
                bills: bills,
                localStorage: window.localStorage,
            });

            document.body.innerHTML = BillsUI({ data: bills });

            //récup id bouton "nouvelle note de frais"
            const btnNewBill = screen.getByTestId("btn-new-bill");

            //création du mock de la fonction à tester
            const handleClickNewBill = jest.fn(
                billsContainer.handleClickNewBill
            );

            //ajout de la fonction à tester sur le listener du bouton
            btnNewBill.addEventListener("click", handleClickNewBill);

            //simulation du clic
            userEvent.click(btnNewBill);

            //vérif que fonction appelée
            expect(handleClickNewBill).toHaveBeenCalled();

            //vérif que bouton présent
            expect(
                screen.getAllByText("Envoyer une note de frais")
            ).toBeTruthy();
        });
    });

    describe("When I am on Bills Page, bills are displayed and I click on the eye button", () => {
        test("Then it should open modal", () => {
            $.fn.modal = jest.fn(); // empêche erreur jQuery

            jest.mock("../app/Store", () => mockStore);

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );

            // défini le chemin d'accès
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = BillsUI({ data: bills });

            const billsContainer = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            //récup id bouton "nouvelle note de frais"
            const iconEye = screen.getAllByTestId("icon-eye")[0];

            //création du mock de la fonction à tester
            const handleClickOnEye = jest.fn(
                billsContainer.handleClickIconEye(iconEye)
            );

            //ajout de la fonction à tester sur le listener du bouton
            iconEye.addEventListener("click", handleClickOnEye);

            //simulation du clic
            userEvent.click(iconEye);

            //vérif que fonction appelée
            expect(handleClickOnEye).toHaveBeenCalled();

            //récup modale
            const modal = screen.getByTestId("modaleFileEmployee");

            //verif présence modale
            expect(modal).toBeTruthy();
        });
    });
});
describe("Given I am a user connected as Employee", () => {
    describe("When I navigate to Bills", () => {
        // test d'intégration GET Bills
        test("fetches bills from mock API GET", async () => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Employee", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("btn-new-bill"));
            const tbody = screen.getByTestId("tbody");
            expect(tbody).toBeTruthy();
        });
    });

    describe("When an error occurs on API", () => {
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
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 404"));
                    },
                };
            });
            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });

        //test API error 500
        test("fetches messages from an API and fails with 500 message error", async () => {
            mockStore.bills.mockImplementationOnce(() => {
                return {
                    list: () => {
                        return Promise.reject(new Error("Erreur 500"));
                    },
                };
            });

            window.onNavigate(ROUTES_PATH.Bills);
            await new Promise(process.nextTick);
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });
});
