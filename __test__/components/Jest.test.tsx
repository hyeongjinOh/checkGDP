import React from 'react';
import "@testing-library/jest-dom";
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Login from '../../app/components/login/Login';
import * as CONST from "../../app/utils/Const";
import DndDashboardLayout from '../../app/components/layout/DndDashboardLayout';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { APIBASE_DEV } from '../../app/utils/api/HttpConf';


const apiUrl = APIBASE_DEV + "/api/v2/auth/login"


// 다국어 적용
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key })
}));

jest.mock('date-fns');
// API 적용
jest.mock("axios");

describe('로그인 테스트', () => {

    const mock = new MockAdapter(axios);
    const data = {
        userId: "test@test.com",
        userPw: "1234qwer!@"
    }
    afterAll(() => {
        mock.restore();
    });
    mock.onPost("/api/v2/auth/login").reply(200, data);

    const { rerender } = render(
        <MemoryRouter>
            <RecoilRoot>
                <Login />
            </RecoilRoot>
        </MemoryRouter>

    );
    it('로그인 성공 테스트', async () => {

        const userId = screen.getByLabelText('아이디 입력') as HTMLInputElement;
        const userPw = screen.getByLabelText('비밀번호 입력') as HTMLInputElement;
        const button = screen.getByRole('button', { name: '로그인' }) as HTMLButtonElement;

        fireEvent.change(userId, { target: { value: 'test@test.com' } });
        fireEvent.change(userPw, { target: { value: '1234qwer!@' } });

        fireEvent.click(button);
      

        // expect(result).toBeTruthy();
        expect(userId.value).toEqual(data.userId)
        expect(userPw.value).toEqual(data.userPw)
        expect(button).toBeEnabled()


        await waitFor(() => {
            console.log("api",);
            
            const successMessage = window.location.pathname;
            expect(successMessage).toBe("/");
        });
        rerender(
            <MemoryRouter>
                <RecoilRoot>
                    <DndDashboardLayout />
                </RecoilRoot>
            </MemoryRouter>
        )
    });
    // it('로그인 실패 테스트', async () => {

    //     const userId = screen.getByLabelText('아이디 입력') as HTMLInputElement;
    //     const userPw = screen.getByLabelText('비밀번호 입력') as HTMLInputElement;
    //     const button = screen.getByRole('button', { name: '로그인' }) as HTMLButtonElement;

    //     fireEvent.change(userId, { target: { value: 'test@test.com' } });
    //     fireEvent.change(userPw, { target: { value: '1234qwer!@' } });
    //     fireEvent.click(button);

    //     expect(userId.value).toEqual("test@test.com")
    //     expect(userPw.value).not.toEqual("11111111")
    //     expect(button).toBeEnabled()

    //     await waitFor(() => {
    //         const successMessage = window.location.pathname;
    //         expect(successMessage).toBe("/");
    //         act(() => {
    //             rerender(
    //                  <MemoryRouter>
    //                      <RecoilRoot>
    //                          <DndDashboardLayout />
    //                      </RecoilRoot>
    //                  </MemoryRouter>
    //              )
    //          });
    //     });
    // });




});


/* 
HttpUtil.PromiseHttp({
      httpMethod: "POST",
      appPath: "/api/v2/user",
      appQuery: {
        userId: userId,
        password: password + confirmPassword, // password 와 confirmPassword 가 다르면 error 만든 비동기 api
        userName: userName,
        phoneNumber: phoneNumber,
        companyName: companyName,
        zoneName: zoneName,
        department: department,
        classificationCode: classificationCode, // 20221031 업종 추가
        agreeTos: strAgreeTos,
        agreePersonalInfo: strAgreePersonalInfo,
        agreeData: strAgreeData,
        // agreeMailReceipt: strAgreeMailReceipt,
        language: apiLang
      },
*/