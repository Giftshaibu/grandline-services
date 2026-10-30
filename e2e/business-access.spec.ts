import {test,expect} from "@playwright/test";
test("owner and staff routes clearly gate unavailable integrations without transmitting data",async({page},info)=>{
 const writes:string[]=[];page.on("request",request=>{if(["POST","PUT","PATCH","DELETE"].includes(request.method())||request.url().includes("/api/v1/"))writes.push(request.url());});
 await page.goto("/my-businesses",{waitUntil:"domcontentloaded"});await expect(page.locator("html")).toHaveAttribute("data-app-ready","true");await expect(page.getByRole("heading",{name:"My businesses",exact:true})).toBeVisible();await expect(page.getByText("Saved applications and billing are not enabled",{exact:false})).toBeVisible();await page.screenshot({path:info.outputPath("owner-access.png"),fullPage:true});
 await page.goto("/staff",{waitUntil:"domcontentloaded"});await expect(page.getByRole("heading",{name:"Services staff workspace"})).toBeVisible();await expect(page.getByText("Staff integrations are not enabled on this deployment.")).toBeVisible();await page.screenshot({path:info.outputPath("staff-access.png"),fullPage:true});expect(writes).toEqual([]);
});
