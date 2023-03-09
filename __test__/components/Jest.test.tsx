import React from 'react';
import "@testing-library/jest-dom";
import { renderHook, act } from '@testing-library/react-hooks';
import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { BrowserRouter as Router, MemoryRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';
import Login from '../../app/components/login/Login';
import * as CONST from "../../app/utils/Const";
import DndDashboardLayout from '../../app/components/layout/DndDashboardLayout';
import axios from 'axios';
import { useAsync } from "react-async";
import * as HttpUtil from '../../app/utils/api/HttpUtil';
import { APIBASE_DEV } from '../../app/utils/api/HttpConf';


// 다국어 적용
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: key => key })
}));
// API 적용
jest.mock('date-fns');
jest.mock(`axios`);
jest.spyOn(axios,'create')
describe('로그인 테스트', () => {
    it('로그인 성공 테스트', async () => {
        const data = {
            userId: "test@test.com",
            userPw: "1234qwer!@"
        }
        const login = '/api/v2/auth/login'
        const { rerender } = render(
            <MemoryRouter>
                <RecoilRoot>
                    <Login />
                </RecoilRoot>
            </MemoryRouter>

        );


        const userId = screen.getByLabelText('아이디 입력') as HTMLInputElement;
        const userPw = screen.getByLabelText('비밀번호 입력') as HTMLInputElement;
        const button = screen.getByRole('button', { name: '로그인' }) as HTMLButtonElement;

        fireEvent.change(userId, { target: { value: 'test@test.com' } });
        fireEvent.change(userPw, { target: { value: '1234qwer!@' } });
        fireEvent.click(button);


        await act(async () => {
            const logs = axios.post(`${APIBASE_DEV+login}`,{
                data:{
                    userId:userId.value,
                    userPw:userPw.value
                }
            })
            console.log("api",logs);
            
            expect(userId.value).toEqual(data.userId)
            expect(userPw.value).toEqual(data.userPw)
            expect(button).toBeEnabled()
            
            waitFor(() => {
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
    });





});

